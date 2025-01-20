from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required,  permission_required

# Importe requests y json
import requests
import json
import datetime


# Restricción de acceso con @login_required
@login_required
@permission_required('main.index_viewer', raise_exception=True)
def index(request):

    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + "/api/v1/landing"

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    # print("Endpoint ", url)
    # print("Response ", response_dict)

    # Respuestas totales
    total_responses = len(response_dict.keys())

    first_response = None
    # for key, value in response_dict.items():
    # fecha_str = value.get("saved")
    # fecha_str = fecha_str.replace("p.\xa0m.", "PM").replace("a.\xa0m.", "AM")
    # print(fecha_str)
    # fecha_datetime = datetime.strptime(fecha_str, "%d/%m/%Y, %I:%M:%S %p")
    # print(fecha_datetime)
    # print("\n")
    # if first_response is None or fecha_datetime < first_response:
    # first_response = fecha_datetime

    # Valores de la respuesta
    responses = response_dict.values()

    # Objeto con los datos a renderizar
    data = {
        "title": "Landing - Dashboard",
        "total_responses": total_responses,
        "first_response": first_response,
        "responses": responses,
    }

    # Renderización en la plantilla
    return render(request, "main/index.html", data)
