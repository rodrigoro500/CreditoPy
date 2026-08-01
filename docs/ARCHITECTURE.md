# CreditoPy - arquitectura inicial

CreditoPy queda preparado como una aplicacion React + Vite + TailwindCSS + Supabase.

## Estructura

- `src/app`: entrada principal de la aplicacion.
- `src/routes`: rutas con React Router.
- `src/components/layout`: layout general, menu lateral y barra inferior movil.
- `src/components/ui`: componentes reutilizables simples.
- `src/features/auth`: pantalla de ingreso.
- `src/features/admin`: aprobacion de usuarios por administrador.
- `src/features/clients`: lista y formulario de clientes.
- `src/features/credits`: lista y formulario de creditos.
- `src/features/fixed-sales`: ventas a cuotas con precio fijo para productos.
- `src/features/payments`: formulario de pagos.
- `src/features/due-dates`: vencimientos.
- `src/features/reports`: reportes.
- `src/lib`: utilidades, calculos, datos demo y cliente Supabase.
- `src/types`: tipos centrales del dominio.
- `supabase/migrations`: esquema inicial de base de datos.

## Modelo de privacidad

Cada tabla principal tiene `user_id`.

Supabase debe usar Row Level Security para que un usuario autenticado solo pueda leer, crear, editar o borrar registros donde `auth.uid() = user_id`.

Esto permite que Carlos tenga sus clientes, creditos y pagos privados, y Roli tenga los suyos sin cruzar informacion.

## Aprobacion y plan Plus

La base incluye `profiles`, `subscriptions` e `internal_users`.

Los nuevos usuarios deben quedar con estado `pending` hasta que un administrador los apruebe. Los planes iniciales son Plus, Premium y Elite. La interfaz muestra un aviso cuando faltan 5 dias o menos para el vencimiento.

Elite permite crear usuarios internos para cobradores. Incluye hasta 3 cobradores y desde el cuarto suma 50.000 Gs. por cobrador, con aprobacion desde el admin de la plataforma.

## Modalidades de credito

CreditoPy soporta dos modalidades:

- Credito con interes: se carga monto entregado, porcentaje, total, cuotas y vencimiento.
- Venta a cuotas con precio fijo: se carga producto, precio final, monto de cuota, frecuencia y vencimiento. No calcula interes por porcentaje.

La segunda modalidad sirve para joyas, electrodomesticos, muebles, motos u otros productos vendidos a credito con precio final definido.

## Reporte de cobranza

Cada credito puede tener un `collection_day`, que representa el dia habitual de cobro.

Con ese dato, la app puede generar una planilla diaria para salir a cobrar. El reporte muestra:

- cliente;
- producto o credito;
- numero de cuotas pagadas sobre total;
- monto de la cuota;
- saldo actual;
- pago cargado en la fecha seleccionada;
- estado pendiente o pagado ese dia.

## Vencimientos de cuotas

Al crear un credito o venta a cuotas, la app genera una lista de cuotas individuales.

Ejemplo con 6 cuotas:

- diario: una cuota por dia;
- semanal: una cuota cada 7 dias;
- quincenal: una cuota cada 14 dias;
- mensual: una cuota cada mes.

La pantalla de creditos muestra el proximo vencimiento pendiente y el vencimiento final del credito.

## Prorroga por interes

Si el cliente no puede pagar la cuota completa, se puede registrar un pago de interes de prorroga.

Ese pago:

- no descuenta el saldo principal;
- queda registrado como movimiento cobrado;
- mueve la cuota pendiente al siguiente periodo;
- mueve tambien todas las cuotas siguientes.

Ejemplo semanal:

- cuota 5 vence 31/07;
- cuota 6 vence 07/08;
- se registra interes de prorroga sobre la cuota 5;
- cuota 5 pasa a 07/08;
- cuota 6 pasa a 14/08.

## Proximo paso recomendado

1. Crear el proyecto en Supabase.
2. Copiar `.env.example` a `.env`.
3. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Ejecutar la migracion `supabase/migrations/001_initial_schema.sql`.
5. Reemplazar `src/lib/mock-data.ts` por consultas reales a Supabase.
6. Activar login real con Supabase Auth.
