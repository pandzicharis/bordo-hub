# Koristi Python 3.8 sliku kao osnovu
FROM python:3.8-slim

# Setuj radnu direktoriju
WORKDIR /app

# Kopiraj sve fajlove u radnu direktoriju
COPY . /app

# Instaliraj Flask (i sve potrebne zavisnosti)
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 5000 za aplikaciju
EXPOSE 5000

# Pokreni Flask aplikaciju
CMD ["python", "app.py"]
