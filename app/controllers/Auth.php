<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class Auth extends Controller {

    public function __construct()
    {
        parent::__construct();
        $this->call->database();
        $this->call->library('api');
    }

    /**
     * POST /auth/register
     * Body: { username, email, password }
     */
    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $username = trim($data['username'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($username) || empty($email) || empty($password)) {
            return $this->api->response([
                'status'  => false,
                'message' => 'username, email, and password are required.',
            ], 400);
        }

        // Check if email already exists
        $existing = $this->db->table('users')
            ->where('email', $email)
            ->get();

        if ($existing) {
            return $this->api->response([
                'status'  => false,
                'message' => 'Email is already registered.',
            ], 409);
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);

        $this->db->table('users')->insert([
            'username'   => $username,
            'email'      => $email,
            'password'   => $hashed,
            'role'       => 'user',
            'is_active'  => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->api->response([
            'status'  => true,
            'message' => 'Registration successful.',
        ], 201);
    }

    /**
     * POST /auth/login
     * Body: { email, password }
     */
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $email    = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            return $this->api->response([
                'status'  => false,
                'message' => 'email and password are required.',
            ], 400);
        }

        $user = $this->db->table('users')
            ->where('email', $email)
            ->where('is_active', 1)
            ->get();

        if (!$user || !password_verify($password, $user['password'])) {
            return $this->api->response([
                'status'  => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $tokens = $this->api->issue_tokens([
            'id'     => $user['id'],
            'role'   => $user['role'],
            'scopes' => ['read', 'write', 'delete'],
        ]);

        return $this->api->response([
            'status'  => true,
            'message' => 'Login successful.',
            'data'    => [
                'user'          => [
                    'id'       => $user['id'],
                    'username' => $user['username'],
                    'email'    => $user['email'],
                    'role'     => $user['role'],
                ],
                'access_token'  => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
            ],
        ], 200);
    }

    /**
     * POST /auth/refresh
     * Body: { refresh_token }
     */
    public function refresh()
    {
        $data          = json_decode(file_get_contents('php://input'), true);
        $refresh_token = trim($data['refresh_token'] ?? '');

        if (empty($refresh_token)) {
            return $this->api->response([
                'status'  => false,
                'message' => 'refresh_token is required.',
            ], 400);
        }

        // refresh_access_token() calls respond() internally and exits on success;
        // it calls respond_error() and exits on failure. No manual response needed.
        $this->api->refresh_access_token($refresh_token);
    }

    /**
     * POST /auth/logout
     * Header: Authorization: Bearer <token>
     */
    public function logout()
    {
        $this->api->require_jwt();

        $data          = json_decode(file_get_contents('php://input'), true);
        $refresh_token = trim($data['refresh_token'] ?? '');

        if (!empty($refresh_token)) {
            $this->api->revoke_refresh_token($refresh_token);
        }

        return $this->api->response([
            'status'  => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }
}
