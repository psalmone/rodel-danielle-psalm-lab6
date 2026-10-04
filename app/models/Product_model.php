<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class Product_model extends Model {

    protected $table = 'products';

    public function get_all()
    {
        return $this->db->table($this->table)
            ->order_by('created_at', 'DESC')
            ->get_all() ?: [];
    }

    public function get_by_id($id)
    {
        return $this->db->table($this->table)
            ->where('id', $id)
            ->get();
    }

    public function create($data)
    {
        return $this->db->table($this->table)->insert($data);
    }

    public function update($id, $data)
    {
        return $this->db->table($this->table)
            ->where('id', $id)
            ->update($data);
    }

    public function delete($id)
    {
        return $this->db->table($this->table)
            ->where('id', $id)
            ->delete();
    }
}
