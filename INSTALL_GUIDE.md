# Guía de Instalación Completa - Software Inventario

Esta guía explica cómo instalar y ejecutar el proyecto en un equipo nuevo desde cero.

## 📦 1. Archivos Necesarios

Para que el proyecto funcione en otro equipo, descárgalo o cópialo.

**NOTA IMPORTANTE SOBRE SEGURIDAD (.env):**
Si descargaste el proyecto de GitHub, el archivo de configuración `.env` no vendrá incluido.
El instalador automático (`setup.ps1`) creará uno nuevo por ti.
- Si copiaste el proyecto por USB, asegúrate de haber copiado también el archivo oculto `backend/.env`.

## 🚀 2. Instalación Automática (Recomendada)

1.  **Abrir carpeta**: Navega a la carpeta del proyecto.
2.  **Ejecutar Script**: Haz clic derecho en el archivo `setup.ps1` y selecciona **"Ejecutar con PowerShell"**.
    - Acepta los permisos de administrador.
    - El script instalará Node.js y todas las dependencias necesarias.

## 🗄️ 3. Configuración de Base de Datos (CRÍTICO)

La mayoría de errores ("Error conectando a la Base de Datos") ocurren aquí.

1.  **Instalar MariaDB o MySQL**:
    - Debes tener un servidor de base de datos instalado (ej: [XAMPP](https://www.apachefriends.org/), [MySQL Community](https://dev.mysql.com/downloads/installer/)).
    - Asegúrate de que el servicio "MySQL" esté **INICIADO** (en verde en XAMPP).

2.  **Crear la Base de Datos**:
    - Abre tu gestor (phpMyAdmin, Workbench, HeidiSQL).
    - Crea una nueva base de datos llamada: `supermercado_db`
    - (Opcional) Importa el esquema si tienes un archivo `.sql` de respaldo. Si no, el sistema intentará crear las tablas.

3.  **Verificar Credenciales**:
    - Abre el archivo `backend/.env` con el Bloc de Notas.
    - Verifica que `DB_USER` y `DB_PASSWORD` coincidan con tu instalación (por defecto XAMPP usa usuario 'root' y contraseña vacía).
    - Verifica el `DB_PORT`. XAMPP usa **3306**. Si tu archivo dice 3333, cámbialo a 3306.

    Ejemplo para XAMPP:
    ```ini
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=supermercado_db
    DB_PORT=3306
    ```

## 🛠️ 4. Ejecución

1.  Haz doble clic en `start.bat`.
2.  Se abrirán dos ventanas negras y el navegador.
3.  Si ves "✅ Conectado a la Base de Datos", ¡todo está listo!

## 🐛 Solución de errores

- **Error: "Error conectando a la Base de Datos"**:
  - ¿Está prendido XAMPP/MySQL?
  - ¿Creaste la base de datos `supermercado_db`?
  - ¿La contraseña en `backend/.env` es correcta?
