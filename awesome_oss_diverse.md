# 🌍 60 Amazing Open-Source Tools Across Different Fields

The open-source world extends far beyond multimedia and AI! Here is a curated list of 60 incredible open-source projects spanning 6 entirely different fields of technology.

---

## 🗄️ Backend & Databases (BaaS / Next-Gen Storage)
*Tools to store data, authenticate users, and replace expensive cloud services.*

1. **[Supabase](https://github.com/supabase/supabase)**: The open-source Firebase alternative (Postgres database, Auth, Storage, and Realtime).
    ```bash
    # Run locally with Docker
    git clone https://github.com/supabase/supabase
    cd supabase/docker
    docker-compose up -d
    ```
2. **[PocketBase](https://github.com/pocketbase/pocketbase)**: A massive open-source backend (database + auth + realtime) bundled in a single lightweight file.
    ```bash
    # Download executable from Github releases, then:
    ./pocketbase serve
    ```
3. **[Appwrite](https://github.com/appwrite/appwrite)**: Secure open-source backend server for Web, Mobile & Flutter developers.
    ```bash
    docker run -it --rm \
        --volume /var/run/docker.sock:/var/run/docker.sock \
        --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
        --entrypoint="install" \
        appwrite/appwrite:latest
    ```
4. **[Meilisearch](https://github.com/meilisearch/meilisearch)**: Lightning-fast, open-source search engine (an amazing alternative to Algolia).
    ```bash
    curl -L https://install.meilisearch.com | sh
    ./meilisearch
    ```
5. **[Redis](https://github.com/redis/redis)**: In-memory data structure store, used as a blazing fast database, cache, and message broker.
    ```bash
    docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
    ```
6. **[SurrealDB](https://github.com/surrealdb/surrealdb)**: A scalable, distributed, collaborative, document-graph database for the real-time web.
    ```bash
    curl -sSf https://install.surrealdb.com | sh
    surreal start --log trace --user root --pass root memory
    ```
7. **[Directus](https://github.com/directus/directus)**: An open-source Headless CMS that instantly turns any SQL database into an API.
    ```bash
    npx create-directus-project my-project
    ```
8. **[Prisma](https://github.com/prisma/prisma)**: Next-generation Node.js and TypeScript ORM.
    ```bash
    npm install prisma --save-dev
    npx prisma init
    ```
9. **[Strapi](https://github.com/strapi/strapi)**: The leading open-source headless CMS. It’s 100% JavaScript and fully customizable.
    ```bash
    npx create-strapi-app@latest my-project --quickstart
    ```
10. **[Keycloak](https://github.com/keycloak/keycloak)**: Open Source Identity and Access Management (Auth & SSO).
    ```bash
    docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
    ```

---

## 🎮 Game Engines & Physics
*Build cross-platform 2D and 3D games entirely for free.*

11. **[Godot Engine](https://github.com/godotengine/godot)**: The ultimate open-source 2D and 3D game engine. Highly capable and a massive rival to Unity.
    ```bash
    # Download binary from official site, or via package manager:
    brew install --cask godot
    ```
12. **[Phaser](https://github.com/photonstorm/phaser)**: A fast, fun, and free open-source HTML5 game framework for WebGL and Canvas.
    ```bash
    npm install phaser
    ```
13. **[Bevy](https://github.com/bevyengine/bevy)**: A refreshingly simple data-driven game engine built in Rust.
    ```toml
    # Add to Cargo.toml
    [dependencies]
    bevy = "0.12.1"
    ```
14. **[Matter.js](https://github.com/liabru/matter-js)**: A powerful 2D rigid body physics engine for the web.
    ```bash
    npm install matter-js
    ```
15. **[Rapier](https://github.com/dimforge/rapier)**: A blazing fast 2D and 3D physics engine written in Rust (often used with React Three Fiber).
    ```bash
    npm install @dimforge/rapier3d
    ```
16. **[Defold](https://github.com/defold/defold)**: A free and open game engine used for cross-platform game development.
    ```bash
    # Download editor from defold.com
    ```
17. **[GDevelop](https://github.com/4ian/GDevelop)**: An open-source, cross-platform game creator designed to be used by everyone - no programming required!
    ```bash
    # Download desktop app from gdevelop.io
    ```
18. **[PlayCanvas](https://github.com/playcanvas/engine)**: A fast and lightweight WebGL game engine.
    ```bash
    npm install playcanvas
    ```
19. **[Kaboom.js](https://github.com/replit/kaboom)**: A JavaScript game programming library that helps you make games fast and fun.
    ```bash
    npm install kaboom
    ```
20. **[O3DE (Open 3D Engine)](https://github.com/o3de/o3de)**: An open-source, real-time 3D engine from Amazon (AWS).
    ```bash
    # Requires compiling from source or using the Windows Installer from o3de.org
    ```

---

## 🛡️ Cybersecurity & Ethical Hacking
*The industry standard tools for securing systems and testing vulnerabilities.*

21. **[Metasploit](https://github.com/rapid7/metasploit-framework)**: The world’s most used penetration testing framework.
    ```bash
    curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall && chmod 755 msfinstall && ./msfinstall
    ```
22. **[Nmap](https://github.com/nmap/nmap)**: Network Mapper. The legendary tool for network discovery and security auditing.
    ```bash
    sudo apt install nmap  # Linux
    brew install nmap      # Mac
    ```
23. **[Wireshark](https://github.com/wireshark/wireshark)**: The world’s foremost and widely-used network protocol analyzer.
    ```bash
    sudo apt install wireshark  # Linux
    brew install --cask wireshark # Mac
    ```
24. **[Hashcat](https://github.com/hashcat/hashcat)**: The world's fastest and most advanced password recovery (cracking) utility.
    ```bash
    sudo apt install hashcat
    ```
25. **[Burp Suite (Community Edition)](https://portswigger.net/burp/communitydownload)**: A graphical tool for testing Web application security.
    ```bash
    # Download the installer from portswigger.net
    ```
26. **[Ghidra](https://github.com/NationalSecurityAgency/ghidra)**: A software reverse engineering (SRE) suite of tools developed by NSA's Research Directorate.
    ```bash
    brew install --cask ghidra
    ```
27. **[OSSEC](https://github.com/ossec/ossec-hids)**: A widely used open-source Host-based Intrusion Detection System (HIDS).
    ```bash
    wget -q -O - https://updates.atomicorp.com/installers/atomic | sudo bash
    sudo apt install ossec-hids
    ```
28. **[Kali Linux](https://gitlab.com/kalilinux)**: The operating system of choice for ethical hackers, bundled with hundreds of open-source tools.
    ```bash
    # Download ISO from kali.org to install as dual-boot or VM
    ```
29. **[TruffleHog](https://github.com/trufflesecurity/trufflehog)**: Finds and verifies credentials (like API keys) accidentally leaked in GitHub repositories.
    ```bash
    brew install trufflesecurity/trufflehog/trufflehog
    ```
30. **[Wazuh](https://github.com/wazuh/wazuh)**: The Open Source Security Platform (XDR & SIEM).
    ```bash
    curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh && sudo bash ./wazuh-install.sh -a
    ```

---

## 📊 Data Science & Visualization
*Crunch massive numbers and create beautiful, interactive charts.*

31. **[D3.js](https://github.com/d3/d3)**: Bring data to life using HTML, SVG, and CSS. The king of custom data visualization on the web.
    ```bash
    npm install d3
    ```
32. **[Pandas](https://github.com/pandas-dev/pandas)**: Fast, powerful, flexible and easy to use open-source data analysis and manipulation tool in Python.
    ```python
    pip install pandas
    ```
33. **[Apache Superset](https://github.com/apache/superset)**: A modern, enterprise-ready business intelligence web application.
    ```bash
    docker pull amancevice/superset
    docker run -d -p 8088:8088 amancevice/superset
    ```
34. **[Plotly](https://github.com/plotly/plotly.js)**: A high-level declarative charting library (great for 3D graphs and scientific data).
    ```bash
    npm install plotly.js-dist-min
    ```
35. **[Metabase](https://github.com/metabase/metabase)**: The easiest way to share data and analytics inside your company without knowing SQL.
    ```bash
    docker run -d -p 3000:3000 --name metabase metabase/metabase
    ```
36. **[Jupyter](https://github.com/jupyter/notebook)**: The standard interactive computational environment for data scientists.
    ```python
    pip install notebook
    jupyter notebook
    ```
37. **[Chart.js](https://github.com/chartjs/Chart.js)**: Simple yet flexible JavaScript charting for designers & developers.
    ```bash
    npm install chart.js
    ```
38. **[Polars](https://github.com/pola-rs/polars)**: Blazingly fast DataFrames in Rust and Python (a faster alternative to Pandas).
    ```python
    pip install polars
    ```
39. **[Apache Spark](https://github.com/apache/spark)**: A unified analytics engine for large-scale data processing (Big Data).
    ```bash
    pip install pyspark
    ```
40. **[Grafana](https://github.com/grafana/grafana)**: The open and composable observatory and data visualization platform (mostly used for server monitoring).
    ```bash
    docker run -d -p 3000:3000 --name=grafana grafana/grafana-enterprise
    ```

---

## 🏗️ DevOps & Infrastructure
*Tools that power the servers of the entire modern internet.*

41. **[Docker](https://github.com/docker)**: The open platform for developing, shipping, and running applications in lightweight containers.
    ```bash
    # Download Docker Desktop from docker.com
    ```
42. **[Kubernetes](https://github.com/kubernetes/kubernetes)**: Production-grade container scheduling and management (Google's gift to the open-source world).
    ```bash
    # Use minikube for local dev
    brew install minikube
    minikube start
    ```
43. **[Terraform](https://github.com/hashicorp/terraform)**: Infrastructure as Code (Write your server setups in a configuration file and deploy).
    ```bash
    brew tap hashicorp/tap
    brew install hashicorp/tap/terraform
    ```
44. **[Ansible](https://github.com/ansible/ansible)**: Radically simple IT automation system. It handles configuration management, application deployment, and more.
    ```bash
    pip install ansible
    ```
45. **[Prometheus](https://github.com/prometheus/prometheus)**: The standard open-source systems monitoring and alerting toolkit.
    ```bash
    docker run -p 9090:9090 prom/prometheus
    ```
46. **[GitLab](https://gitlab.com/gitlab-org/gitlab)**: An entire open-source DevOps platform, delivered as a single application.
    ```bash
    # Run a local instance using Docker
    docker run --detach --hostname gitlab.example.com --publish 443:443 --publish 80:80 --name gitlab gitlab/gitlab-ee:latest
    ```
47. **[Traefik](https://github.com/traefik/traefik)**: A modern HTTP reverse proxy and load balancer that makes deploying microservices easy.
    ```bash
    docker run -d -p 8080:8080 -p 80:80 -v $PWD/traefik.yml:/etc/traefik/traefik.yml traefik:v2.10
    ```
48. **[Nginx](https://github.com/nginx/nginx)**: High performance load balancer, web server, & reverse proxy (runs a huge percentage of the web).
    ```bash
    docker run --name mynginx1 -p 80:80 -d nginx
    ```
49. **[Caddy](https://github.com/caddyserver/caddy)**: Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS.
    ```bash
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update && sudo apt install caddy
    ```
50. **[LocalStack](https://github.com/localstack/localstack)**: A fully functional local cloud stack. Develop and test your cloud & Serverless apps offline!
    ```bash
    pip install localstack
    localstack start -d
    ```

---

## ⚙️ Productivity & Automation
*Automate your life, build workflows, and boost productivity without SaaS fees.*

51. **[n8n](https://github.com/n8n-io/n8n)**: Free and open fair-code alternative to Zapier. Automate workflows by connecting different APIs.
    ```bash
    docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
    ```
52. **[OBS Studio](https://github.com/obsproject/obs-studio)**: Free and open source software for video recording and live streaming.
    ```bash
    # Download installer from obsproject.com
    ```
53. **[Huginn](https://github.com/huginn/huginn)**: Create agents that monitor the web and act on your behalf (Like a self-hosted IFTTT).
    ```bash
    docker run -it -p 3000:3000 ghcr.io/huginn/huginn
    ```
54. **[Penpot](https://github.com/penpot/penpot)**: The open-source design and prototyping platform (The ultimate free alternative to Figma).
    ```bash
    curl -o docker-compose.yaml https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml
    docker-compose up -d
    ```
55. **[AutoKuma / Uptime Kuma](https://github.com/louislam/uptime-kuma)**: A fancy self-hosted monitoring tool to ping your websites and alert you if they go down.
    ```bash
    docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
    ```
56. **[AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)**: Open-source alternative to Notion. You are in charge of your data and customizations.
    ```bash
    # Download desktop app from appflowy.io
    ```
57. **[Logseq](https://github.com/logseq/logseq)**: A privacy-first, open-source knowledge base that works on top of local plain-text Markdown files.
    ```bash
    # Download desktop app from logseq.com
    ```
58. **[Cal.com](https://github.com/calcom/cal.com)**: The open-source alternative to Calendly. Schedule meetings without the friction.
    ```bash
    git clone https://github.com/calcom/cal.com.git
    cd cal.com
    yarn
    yarn dx
    ```
59. **[Typebot](https://github.com/baptisteArno/typebot.io)**: A conversational form builder that you can self-host. An incredible open-source alternative to Typeform.
    ```bash
    git clone https://github.com/baptisteArno/typebot.io.git
    cd typebot.io
    docker-compose up -d
    ```
60. **[Hoppscotch](https://github.com/hoppscotch/hoppscotch)**: Open source API development ecosystem (A fast, beautiful alternative to Postman).
    ```bash
    docker run -p 3000:3000 hoppscotch/hoppscotch
    ```
