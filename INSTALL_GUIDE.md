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
    - El script:
        - Instalará Node.js si no lo tienes.
        - **Instalará MariaDB** si no detecta una base de datos (te preguntará antes).
        - Instalará todas las dependencias.
        - Creará la base de datos y cargará las tablas automáticamente.

## 🗄️ 3. Configuración de Base de Datos

Si el script automático instaló MariaDB, **¡ya está todo listo!**

Si prefieres hacerlo manual o usas XAMPP:
1.  Asegúrate de que MySQL esté INICIADO.
2.  El script intentará crear la base de datos `supermercado_db` por ti.
3.  Si falla, abre tu gestor SQL y crea una base de datos llamada `supermercado_db`.
4.  Verifica que `backend/.env` tenga el puerto correcto (3306).

## 🛠️ 4. Ejecución

1.  Haz doble clic en `start.bat`.
2.  Se abrirán dos ventanas negras y el navegador.
3.  Busca el mensaje "✅ Conectado a la Base de Datos" en la ventana del backend.

## 🐛 Solución de errores

- **Error: "Error conectando a la Base de Datos"**:
  - Asegúrate de que el servicio MySQL esté corriendo.
  - El script automático usa el usuario `root` sin contraseña. Si tu base de datos tiene contraseña, edita el archivo `backend/.env`.
