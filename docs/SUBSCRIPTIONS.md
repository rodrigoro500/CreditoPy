# Aprobacion de usuarios y plan Plus

## Flujo recomendado

1. El usuario se registra con Supabase Auth.
2. Se crea un registro en `profiles` con `approval_status = 'pending'`.
3. El administrador entra a `Admin > Aprobacion de usuarios`.
4. El administrador aprueba o rechaza la cuenta.
5. Al aprobar, se crea o activa una suscripcion:
   - Plus: 50.000 Gs., hasta 100 clientes.
   - Premium: 100.000 Gs., clientes ilimitados.
   - Elite: 200.000 Gs., clientes ilimitados, admin y hasta 3 cobradores incluidos.
   - `starts_at = fecha de aprobacion`
   - `expires_at = fecha de aprobacion + 30 dias`
6. Si faltan 5 dias o menos para el vencimiento, la app muestra un aviso superior.

## Prueba gratis

El administrador puede aprobar un usuario nuevo con prueba Plus gratis por 7 dias.

En ese caso:

- `plan_code = 'plus'`;
- `plan_price = 50000`;
- `monthly_total = 0`;
- `paid_at = null`;
- `expires_at = fecha de aprobacion + 7 dias`.

Cuando el usuario pague, la renovacion normal debe pasar a 30 dias y `monthly_total` vuelve al precio del plan.

## Cobradores internos

El plan Elite incluye hasta 3 cobradores internos.

A partir del cuarto cobrador:

- se cobra 50.000 Gs. adicionales por cada cobrador;
- el cobrador extra debe quedar pendiente;
- solo el administrador de la plataforma puede aprobarlo desde el panel admin.

## Reglas de privacidad

Los clientes, creditos y pagos solo se pueden gestionar si:

- el registro pertenece al usuario autenticado;
- el perfil del usuario esta aprobado.

Esto evita que una cuenta pendiente pueda empezar a usar la plataforma antes de la autorizacion del administrador.

## Pendiente para la siguiente etapa

- Conectar el registro real de usuarios con Supabase Auth.
- Crear una funcion `handle_new_user` para insertar el perfil automaticamente.
- Guardar pagos del plan en una tabla de movimientos administrativos.
- Agregar botones reales para aprobar, rechazar y renovar suscripcion.
- Activar la creacion real de usuarios internos/cobradores.
