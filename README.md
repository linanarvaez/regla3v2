# Regla 3-3-3 v2

Aplicación de planificación diaria con arquitectura desacoplada.

## Estructura
- **Frontend**: Next.js 14 (App Router) en `/frontend`.
- **Backend**: FastAPI (Python) en `/backend`.

## Requisitos
- Node.js 18+
- Python 3.10+

## Ejecución Local

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Notas
- El backend utiliza SQLite por defecto para persistencia.
- El frontend se comunica vía `NEXT_PUBLIC_API_BASE_URL`.
