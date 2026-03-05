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

## Nuevas Funcionalidades de Liderazgo (v2.1)
Se ha extendido la plataforma para incluir una vista de equipo orientada a liderazgo:
- **KPIs del Equipo**: Métricas agregadas de cumplimiento, usuarios activos y días registrados.
- **Tendencia Semanal**: Gráfico de ejecución del equipo en los últimos 7 días.
- **Promedio por Categoría**: Visualización del rendimiento por tipo de tarea (Críticas, Admin, Micro).
- **Indicador de Consistencia**: Seguimiento de cumplimiento por usuario y días perfectos.
- **Alertas Estratégicas**: Identificación automática de prioridades críticas no completadas.

## Notas
- El backend utiliza SQLite por defecto para persistencia.
- El frontend se comunica vía `NEXT_PUBLIC_API_BASE_URL`.
