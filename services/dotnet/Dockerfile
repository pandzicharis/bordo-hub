FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dev
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./

# Install EF Core tools
RUN dotnet tool install --global dotnet-ef

# Add dotnet tools to PATH
ENV PATH="${PATH}:/root/.dotnet/tools"

EXPOSE 80

CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]
