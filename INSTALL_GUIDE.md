# Guía de Instalación Completa - Software Inventario

Esta guía explica cómo instalar y ejecutar el proyecto en un equipo nuevo desde cero.

## 📦 1. Archivos Necesarios

Para que el proyecto funcione en otro equipo, necesitas copiar **toda la carpeta del proyecto**, PERO hay un archivo crítico que **NO** se suele copiar automáticamente si se descarga desde GitHub: el archivo `.env`.

### 🚨 IMPORTANTE: El archivo `.env`
El archivo `.env` contiene tus contraseñas y configuración secreta.
- **Ubicación**: `backend/.env`
- **Acción**: Si estás moviendo el proyecto manualmente (USB, red), asegúrate de copiar este archivo. Si usaste GitHub, este archivo NO se subió por seguridad.

**Si descargaste el proyecto de GitHub:**
El script de instalación automática (`setup.ps1`) creará uno nuevo por ti con valores por defecto. Si tu base de datos tiene contraseña, deberás editar el archivo `backend/.env` manualmente.

## 🚀 2. Instalación Automática (Recomendada)

Hemos creado un script que hace todo el trabajo difícil.

1.  **Abrir carpeta**: Navega a la carpeta del proyecto.
2.  **Ejecutar Script**: Haz clic derecho en el archivo `setup.ps1` y selecciona **"Ejecutar con PowerShell"**.
    - Si te pide permisos de administrador, acéptalos.
    - El script verificará Node.js, instalará todas las librerías y configurará el entorno.

## 🛠️ 3. Ejecución

Una vez instalado (ya sea manualmente o con el script):

1.  Busca el archivo `start.bat` en la carpeta principal.
2.  Haz doble clic en él.
3.  Se abrirán dos ventanas negras (servidores) y tu navegador con la aplicación.

## 🐛 Solución de Problemas Comunes

- **Error de Base de Datos**: Si ves errores de conexión ("Access denied", "ECONNREFUSED"), abre el archivo `backend/.env` con un bloc de notas y verifica que `DB_PASSWORD` sea la contraseña correcta de tu MySQL local.
- **Node no reconocido**: Si `setup.ps1` dice que Node falta, descárgalo e instálalo desde [nodejs.org](https://nodejs.org/).
