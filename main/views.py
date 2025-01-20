from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required

# Importe requests y json
import requests
import json
from datetime import datetime
from collections import Counter


# Restricción de acceso con @login_required
@login_required
@permission_required("main.index_viewer", raise_exception=True)
def index(request):

    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + "/api/v1/landing"

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    # Respuestas totales
    total_responses = len(response_dict.keys())

    first_response = None
    last_response = None
    date_counts = Counter()

    for key, value in response_dict.items():
        fecha_str = value.get("saved")
        if not fecha_str:
            continue

        fecha_str = fecha_str.replace("\xa0", " ")
        try:
            fecha_datetime = datetime.strptime(fecha_str, "%d/%m/%Y, %I:%M:%S %p")

            if first_response is None or fecha_datetime < first_response:
                first_response = fecha_datetime

            if last_response is None or fecha_datetime > last_response:
                last_response = fecha_datetime

            # Contar las fechas por día
            date_counts[fecha_datetime.date()] += 1

        except ValueError as e:
            print(f"Error al procesar la fecha '{fecha_str}': {e}")

    print(f"Fecha más antigua encontrada: {first_response}")
    print(f"Fecha más reciente encontrada: {last_response}")

    # Obtener el día con más respuestas
    most_common_day, most_common_count = (
        date_counts.most_common(1)[0] if date_counts else (None, 0)
    )

    # Formatear fechas a short date (DD/MM/YYYY)
    first_response_str = first_response.strftime("%d/%m/%Y") if first_response else None
    last_response_str = last_response.strftime("%d/%m/%Y") if last_response else None
    most_common_day_str = (
        most_common_day.strftime("%d/%m/%Y") if most_common_day else None
    )

    # Valores de la respuesta
    responses = response_dict.values()

    # Objeto con los datos a renderizar
    data = {
        "title": "MotorCity - Dashboard",
        "total_responses": total_responses,
        "first_response": first_response_str,
        "last_response": last_response_str,
        "high_rate_responses": str(most_common_day_str)
        + " ("
        + str(most_common_count)
        + " respuestas)",
        "responses": responses,
    }

    # Renderización en la plantilla
    return render(request, "main/index.html", data)
