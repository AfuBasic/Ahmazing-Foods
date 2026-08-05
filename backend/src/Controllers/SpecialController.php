<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use DateTime;
use DateTimeZone;
use PDO;
use PDOException;

class SpecialController {
    private array $specials = [
        [
            'name' => 'Nkwobi',
            'description' => 'Spiced cow foot slow-cooked in a palm oil and utazi sauce. Rich, warming and deeply satisfying.'
        ],
        [
            'name' => 'Isi Ewu',
            'description' => 'Goat head pepper soup — tender meat, aromatic spices. Not for the faint-hearted, but deeply rewarding.'
        ],
        [
            'name' => 'Abacha (African Salad)',
            'description' => 'Shredded cassava with ugba (oil bean seeds), dried fish, garden eggs and a bold palm oil dressing.'
        ],
        [
            'name' => 'Ukwa (Breadfruit Porridge)',
            'description' => 'A forgotten treasure. Breadfruit cooked with palm oil, crayfish and seasonings — earthy, filling, unique.'
        ],
        [
            'name' => 'Assorted Meat Pepper Soup',
            'description' => 'Goat, cow foot, tripe and offal in a light, aromatic pepper soup broth. Warming and deeply flavoured.'
        ],
        [
            'name' => 'Roasted Plantain with Pepper & Fish',
            'description' => 'Whole plantain roasted over open flame, served with a spiced pepper sauce and your choice of fish — Tilapia or Croaker.'
        ]
    ];

    private function getMondayOf(): string {
        $now = new DateTime('now', new DateTimeZone('Africa/Lagos'));
        $dayOfWeek = (int)$now->format('w'); // 0=Sun, 1=Mon ... 6=Sat
        $diff = $dayOfWeek === 0 ? -6 : 1 - $dayOfWeek;
        $now->modify("{$diff} days");
        return $now->format('Y-m-d');
    }

    private function checkVotingOpen(): bool {
        $lagosNow = new DateTime('now', new DateTimeZone('Africa/Lagos'));
        $day = (int)$lagosNow->format('w');
        $hour = (int)$lagosNow->format('G');

        if ($day === 0 || $day === 6) return false;
        if ($day === 5 && $hour >= 12) return false;
        return true;
    }

    private function getVotingClosesAt(): string {
        $lagosNow = new DateTime('now', new DateTimeZone('Africa/Lagos'));
        $day = (int)$lagosNow->format('w');
        $daysUntilFriday = (5 - $day + 7) % 7;
        if ($daysUntilFriday === 0 && !$this->checkVotingOpen()) {
            $daysUntilFriday = 7;
        }
        $lagosNow->modify("+{$daysUntilFriday} days");
        $lagosNow->setTime(12, 0, 0);
        return $lagosNow->format('c');
    }

    private function normalizePhone(string $phone): string {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) return '234' . substr($digits, 1);
        if (!str_starts_with($digits, '234')) return '234' . $digits;
        return $digits;
    }

    public function getVotes(): void {
        $db = Database::getConnection();
        $weekOf = $this->getMondayOf();
        $isVotingOpen = $this->checkVotingOpen();

        $stmt = $db->prepare("SELECT special_name, COUNT(*) as votes FROM specials_votes WHERE week_of = :week_of GROUP BY special_name");
        $stmt->execute(['week_of' => $weekOf]);
        $rows = $stmt->fetchAll();

        $voteCounts = [];
        foreach ($rows as $row) {
            $voteCounts[$row['special_name']] = (int)$row['votes'];
        }

        $totalVotes = array_sum($voteCounts);
        $options = [];
        foreach ($this->specials as $s) {
            $options[] = [
                'name' => $s['name'],
                'description' => $s['description'],
                'votes' => $voteCounts[$s['name']] ?? 0,
            ];
        }

        $winner = null;
        if (!$isVotingOpen && $totalVotes > 0) {
            usort($options, fn($a, $b) => $b['votes'] <=> $a['votes']);
            $winner = $options[0]['name'];
        }

        Response::json([
            'weekOf' => $weekOf,
            'isVotingOpen' => $isVotingOpen,
            'votingClosesAt' => $this->getVotingClosesAt(),
            'options' => $options,
            'winner' => $winner,
            'totalVotes' => $totalVotes,
        ]);
    }

    public function castVote(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $specialName = $input['specialName'] ?? null;
        $voterPhone = $input['voterPhone'] ?? null;

        $validNames = array_column($this->specials, 'name');
        if (!$specialName || !in_array($specialName, $validNames, true)) {
            Response::error('Invalid special selected', 400);
        }

        if (!$voterPhone || !is_string($voterPhone)) {
            Response::error('Phone number is required', 400);
        }

        $phone = $this->normalizePhone($voterPhone);
        if (strlen($phone) < 10) {
            Response::error('Please enter a valid phone number', 400);
        }

        if (!$this->checkVotingOpen()) {
            Response::error('Voting has closed for this week', 400);
        }

        $weekOf = $this->getMondayOf();
        $db = Database::getConnection();

        try {
            $stmt = $db->prepare("INSERT INTO specials_votes (special_name, week_of, voter_phone) VALUES (:special_name, :week_of, :voter_phone)");
            $stmt->execute([
                'special_name' => $specialName,
                'week_of' => $weekOf,
                'voter_phone' => $phone,
            ]);

            Response::json(['success' => true, 'message' => "Vote recorded for {$specialName}"]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23505' || str_contains($e->getMessage(), 'unique constraint') || str_contains($e->getMessage(), 'Duplicate')) {
                Response::error('You have already voted this week', 409);
            } else {
                Response::error('Could not record vote. Please try again.', 500);
            }
        }
    }
}
