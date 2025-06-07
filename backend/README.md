# Backend API for Skripsi Dika

This is a Node.js/Express backend that connects to MongoDB Atlas for data storage.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## API Endpoints

### Data API

- `GET /api/data` - Get all data entries (sorted by timestamp)
- `POST /api/data` - Create a new data entry
  - Required fields: `tower1`, `tower2`, `tower3`, `rssi`
- `DELETE /api/data` - Delete all data entries

## Example POST Request

```json
{
  "tower1": 120,
  "tower2": 85,
  "tower3": 150,
  "rssi": -75
}
```

## Environment Variables

The following environment variables are used:
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
