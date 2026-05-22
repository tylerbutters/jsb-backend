# JSB Backend

Node.js API for the Japanese Sentence Builder frontend.

## Requirements

- Node.js 20.x

## Scripts

```sh
npm start
npm run dev
npm test
```

The API listens on `http://localhost:4000` by default. Set `PORT` to change it.

## Environment

```sh
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

## Endpoints

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

### `POST /api/translate`

Request:

```json
{ "text": "猫です" }
```

Response:

```json
{ "translation": "It is a cat." }
```
