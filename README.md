# Panel Pau

Panel web (Kanban) para seguir licitaciones y subvenciones de **Gust de Camp** y **Ulivarda**.

## Qué hace

- Dos pestañas: Gust de Camp / Ulivarda
- Cuatro columnas: Nuevas → Para revisar → Solicitadas → Cerradas
- Badge **NEW** en las tarjetas añadidas hoy
- Mover tarjetas entre columnas (◀ ▶)
- Eliminar tarjetas manualmente (🗑️)
- Las tarjetas con plazo vencido se muestran tachadas/atenuadas
- Móvil: selector de columna arriba. Escritorio: 4 columnas.

## Datos

Las tarjetas se leen de `data/items.json`. El cron diario añade nuevas entradas a ese archivo y hace push al repo; Vercel redespliega solo.

El estado (columna de cada tarjeta y borrados) se guarda en el navegador (localStorage), así cada persona mantiene su propia organización sin backend.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Despliegue (Vercel)

1. Subir este repo a GitHub (usuario: `gustdecamp`).
2. En vercel.com → New Project → importar el repo.
3. Deploy. Vercel detecta Next.js automáticamente, sin configuración.
