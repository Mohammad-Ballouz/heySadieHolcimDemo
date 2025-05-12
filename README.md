# Holcim Order Management Portal Demo

A small demo application that shows an order management portal for Holcim with the ability to view orders and update order quantities.

## Features

- View a list of all orders in the database
- Update order quantities (add or remove)
- Real-time UI updates
- Toast notifications for actions
- Responsive design

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. Clone or download this repository
2. Navigate to the project folder
3. Install dependencies:

```bash
npm install
```

4. Start the application:

```bash
npm start
```

5. Open your browser and go to: `http://localhost:3000`

## API Endpoints

The application exposes the following API endpoints:

- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderCode` - Get a specific order by order code
- `PUT /api/orders/edit-order` - Update an order quantity (Legacy format)
- `POST /api/orders/edit-order` - Update an order quantity (New format with call_id)
- `POST /webhooks` - Webhook endpoint that always returns 200 OK

### Edit Order Endpoint (Legacy)

To update an order's quantity using the legacy format, send a PUT request to `/api/orders/edit-order` with the following JSON body:

```json
{
  "order_code": 7051,
  "request_type": "add_quantity",
  "quantity": 50
}
```

### Edit Order Endpoint (New Format)

To update an order's quantity using the new format, send a POST request to `/api/orders/edit-order` with the following JSON body:

```json
{
  "call_id": "call_id_here",
  "arguments": {
    "order_code": 7051,
    "request_type": "add_quantity",
    "quantity": 50
  }
}
```

Response format:

```json
{
  "call_id": "call_id_here",
  "result": {
    "message": "Order 7051 has been updated successfully.",
    "order": {
      "id": 1,
      "customerName": "Ulan Mobile #1 NSW Concrete",
      "orderCode": 7051,
      "ordrqy": 550.0,
      ...
    }
  }
}
```

### Webhook Endpoint

The application has a simple webhook endpoint that always returns a 200 OK response:

```
POST /webhooks
```

You can POST any JSON data to this endpoint and it will always return:

```json
{
  "status": "success",
  "message": "Webhook received successfully"
}
```

The request body is logged but not processed.

### Request Parameters

For the edit-order endpoints:

- `order_code` (required): The numeric code of the order to update (e.g., 7051)
- `request_type` (required): Either "add_quantity" or "remove_quantity"
- `quantity` (required): The amount to add or remove (must be positive)

## Exposing to Public Internet with ngrok

To expose your local development server to the public internet using ngrok:

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)

2. Run your application:
```bash
npm start
```

3. In a new terminal window, run ngrok to expose your local server:
```bash
ngrok http 3000
```

4. Ngrok will generate a public URL that you can share with others to access your application.

## Database

The application uses SQLite for the database, stored in `orders.db` in the project root.

## License

This is a demo application and is not intended for production use. 