from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from aiida.manage import manager
from qeapp.backend.app.daemon import router as daemon_router
from qeapp.backend.app.computer import router as computer_router
from qeapp.backend.app.code import router as code_router
from qeapp.backend.app.job_history import router as job_history_router
from qeapp.backend.app.datanode import router as datanode_router
from qeapp.backend.app.calculation import router as calculation_router
from qeapp.backend.app.plugins.bands.api import router as bands_router
from qeapp.backend.app.plugins.pdos.api import router as pdos_router
from qeapp.backend.app.plugins.electronic_structure.api import router as electronic_structure_router
from qeapp.backend.app.plugins.xps.api import router as xps_router
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from fastapi.responses import FileResponse
from fastapi.exception_handlers import http_exception_handler
from starlette.exceptions import HTTPException as StarletteHTTPException

from pydantic_settings import BaseSettings
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class BackendSettings(BaseSettings):
    """
    Settings can be set by setting the environment variables in upper case.
    For example for setting `qeapp_gui_profile` one has to export
    the evironment variable `qeapp_GUI_PROFILE`.
    """

    qeapp_gui_profile: str = ""  # if empty aiida uses default profile


backend_settings = BackendSettings()

app = FastAPI()
manager.get_manager().load_profile(backend_settings.qeapp_gui_profile)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/api", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to AiiDA-WorkGraph."}


app.include_router(job_history_router)
app.include_router(datanode_router)
app.include_router(daemon_router)
app.include_router(computer_router)
app.include_router(code_router)
app.include_router(bands_router)
app.include_router(pdos_router)
app.include_router(electronic_structure_router)
app.include_router(xps_router)

# only import the submit router after loading the profile
from qeapp.backend.app.submit import router as submit_router
app.include_router(submit_router)
app.include_router(calculation_router)


@app.get("/debug")
async def debug() -> dict:
    return {"loaded_aiida_profile": manager.get_manager().get_profile()}


@app.get("/backend-setting")
async def backend_settings():
    return backend_settings


# Integrating React build into a FastAPI application and serving the build (HTML, CSS, JavaScript) as static files
"""
When navigate to http://127.0.0.1:8000/settings from http://127.0.0.1:8000/ using client-side
routing (i.e., links within your React app), the React Router handles the route /settings
without reloading the page from the server. This is why it works.
However, when you refresh the page at http://127.0.0.1:8000/settings, the browser makes
a request to the FastAPI server for /settings. Since this route isn't defined in FastAPI
(it's a client-side route), the server returns a 404 Not Found error.
so we use the index.html serve all routes except API specific ones, then load all static assets.
"""
backend_dir = Path(__file__).parent
build_dir = backend_dir / "../../frontend/build/"
build_dir = os.getenv("REACT_BUILD_DIR", build_dir)


@app.exception_handler(StarletteHTTPException)
async def _spa_server(req: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return FileResponse(f"{build_dir}/index.html", media_type="text/html")
    else:
        return await http_exception_handler(req, exc)


if os.path.isdir(build_dir):
    app.mount(
        "/static/",
        StaticFiles(directory=build_dir / "static"),
        name="React app static files",
    )
    app.mount(
        "/example_structures/",
        StaticFiles(directory=build_dir / "example_structures"),
        name="example_structures",
    )
