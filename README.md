# CreditoPy

Base inicial para una aplicacion web de control de creditos de clientes.

## Tecnologias

- React
- Vite
- TailwindCSS
- React Router
- Supabase

## Funciones preparadas

- Clientes
- Creditos con monto, porcentaje de interes, total, cuotas, frecuencia y vencimiento
- Ventas a cuotas con precio fijo para joyas o cualquier producto
- Pagos con fecha, monto y metodo efectivo o transferencia
- Calculo de saldo
- Vencimientos
- Reportes
- Planilla diaria de cobranza por dia asignado
- Privacidad por usuario autenticado mediante Supabase RLS
- Aprobacion de usuarios por administrador
- Plan Plus de 50.000 Gs. con vencimiento cada 30 dias
- Prueba gratis de 7 dias del Plan Plus para usuarios nuevos
- Plan Premium de 100.000 Gs. con clientes ilimitados
- Plan Elite de 200.000 Gs. con admin y hasta 3 cobradores internos
- Recargo de 50.000 Gs. por cada cobrador desde el cuarto, aprobado por admin
- Aviso visible 5 dias antes del vencimiento

## Modo de prueba local

La app ya permite cargar datos de prueba directamente en el navegador:

- crear clientes;
- crear creditos con interes;
- crear ventas a cuotas con precio fijo;
- registrar pagos;
- ver saldos actualizados;
- revisar reportes y planilla de cobranza.

Estos datos se guardan en `localStorage`. Desde Reportes se pueden restaurar los datos demo.

## Comenzar

```bash
npm install
npm run dev
```

Para conectar Supabase:

```bash
cp .env.example .env
```

Luego completar:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

El esquema inicial esta en:

```text
supabase/migrations/001_initial_schema.sql
```
