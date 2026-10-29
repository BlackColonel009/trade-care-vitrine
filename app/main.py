from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


APP_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Trade Care - Site vitrine",
    docs_url=None,
    redoc_url=None,
)
app.mount("/static", StaticFiles(directory=APP_DIR / "static"), name="static")
templates = Jinja2Templates(directory=APP_DIR / "templates")


def render(request: Request, template_name: str) -> HTMLResponse:
    return templates.TemplateResponse(
        request=request,
        name=template_name,
        context={},
    )


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
@app.get("/index.html", response_class=HTMLResponse, include_in_schema=False)
def home(request: Request) -> HTMLResponse:
    return render(request, "index.html")


@app.get("/fonctionnalites", response_class=HTMLResponse, include_in_schema=False)
@app.get(
    "/fonctionnalites.html", response_class=HTMLResponse, include_in_schema=False
)
def features(request: Request) -> HTMLResponse:
    return render(request, "fonctionnalites.html")


@app.get("/abonnements", response_class=HTMLResponse, include_in_schema=False)
@app.get("/abonnements.html", response_class=HTMLResponse, include_in_schema=False)
def subscriptions(request: Request) -> HTMLResponse:
    return render(request, "abonnements.html")


@app.get("/contact", response_class=HTMLResponse, include_in_schema=False)
@app.get("/contact.html", response_class=HTMLResponse, include_in_schema=False)
def contact(request: Request) -> HTMLResponse:
    return render(request, "contact.html")


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok", "service": "trade-care-vitrine"}
