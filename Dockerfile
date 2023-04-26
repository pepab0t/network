FROM python:3.10-alpine3.16

COPY . /user/app/

WORKDIR /user/app

RUN pip install -r requirements.txt
RUN python3 manage.py makemigrations network && python3 manage.py migrate

CMD ["python3", "manage.py", "runserver", "0.0.0.0:5000"]