<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class Products extends Controller {

    public function __construct()
    {
        parent::__construct();
        $this->call->database();
        $this->call->library('api');
        $this->call->model('Product_model', 'product');
    }

    /**
     * GET /products
     * Returns all products (JWT protected)
     */
    public function index()
    {
        $this->api->require_jwt();

        $products = $this->product->get_all();

        return $this->api->response([
            'status' => true,
            'data'   => $products,
        ], 200);
    }

    /**
     * GET /products/show/:id
     * Returns a single product by ID (JWT protected)
     */
    public function show($id)
    {
        $this->api->require_jwt();

        $product = $this->product->get_by_id($id);

        if (!$product) {
            return $this->api->response([
                'status'  => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return $this->api->response([
            'status' => true,
            'data'   => $product,
        ], 200);
    }

    /**
     * POST /products/store
     * Creates a new product (JWT protected)
     * Body: { product_name, description, price, quantity }
     */
    public function store()
    {
        $this->api->require_jwt();

        $data = json_decode(file_get_contents('php://input'), true);

        $product_name = trim($data['product_name'] ?? '');
        $description  = trim($data['description'] ?? '');
        $price        = $data['price'] ?? null;
        $quantity     = $data['quantity'] ?? null;

        if (empty($product_name) || $price === null || $quantity === null) {
            return $this->api->response([
                'status'  => false,
                'message' => 'product_name, price, and quantity are required.',
            ], 400);
        }

        if (!is_numeric($price) || $price < 0) {
            return $this->api->response([
                'status'  => false,
                'message' => 'price must be a valid non-negative number.',
            ], 400);
        }

        if (!is_numeric($quantity) || $quantity < 0) {
            return $this->api->response([
                'status'  => false,
                'message' => 'quantity must be a valid non-negative integer.',
            ], 400);
        }

        $id = $this->product->create([
            'product_name' => $product_name,
            'description'  => $description,
            'price'        => (float) $price,
            'quantity'     => (int) $quantity,
        ]);

        $newProduct = $this->product->get_by_id($id);

        return $this->api->response([
            'status'  => true,
            'message' => 'Product created successfully.',
            'data'    => $newProduct,
        ], 201);
    }

    /**
     * PUT /products/update/:id
     * Updates a product (JWT protected)
     * Body: { product_name, description, price, quantity }
     */
    public function update($id)
    {
        $this->api->require_jwt();

        $existing = $this->product->get_by_id($id);
        if (!$existing) {
            return $this->api->response([
                'status'  => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $product_name = trim($data['product_name'] ?? $existing['product_name']);
        $description  = trim($data['description'] ?? $existing['description']);
        $price        = $data['price'] ?? $existing['price'];
        $quantity     = $data['quantity'] ?? $existing['quantity'];

        if (!is_numeric($price) || $price < 0) {
            return $this->api->response([
                'status'  => false,
                'message' => 'price must be a valid non-negative number.',
            ], 400);
        }

        if (!is_numeric($quantity) || $quantity < 0) {
            return $this->api->response([
                'status'  => false,
                'message' => 'quantity must be a valid non-negative integer.',
            ], 400);
        }

        $this->product->update($id, [
            'product_name' => $product_name,
            'description'  => $description,
            'price'        => (float) $price,
            'quantity'     => (int) $quantity,
        ]);

        $updated = $this->product->get_by_id($id);

        return $this->api->response([
            'status'  => true,
            'message' => 'Product updated successfully.',
            'data'    => $updated,
        ], 200);
    }

    /**
     * DELETE /products/destroy/:id
     * Deletes a product (JWT protected)
     */
    public function destroy($id)
    {
        $this->api->require_jwt();

        $existing = $this->product->get_by_id($id);
        if (!$existing) {
            return $this->api->response([
                'status'  => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $this->product->delete($id);

        return $this->api->response([
            'status'  => true,
            'message' => 'Product deleted successfully.',
        ], 200);
    }
}
