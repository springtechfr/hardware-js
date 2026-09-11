document.addEventListener('alpine:init', () => {
    Alpine.store('auth', {
        apiRoute: "https://vi1ch5yfp2.execute-api.eu-west-1.amazonaws.com/dev",
        STORAGE_KEY: 'parc_auth',

        getToken() {
            return sessionStorage.getItem(this.STORAGE_KEY) || '';
        },

        isAuthenticated() {
            return Boolean(this.getToken());
        },

        setCredentials(username, password) {
            if (username && password) {
                sessionStorage.setItem(this.STORAGE_KEY, `${username}:${password}`);
            }
        },

		logoutSilently() {
			sessionStorage.removeItem(this.STORAGE_KEY);
		},

        logout() {
            sessionStorage.removeItem(this.STORAGE_KEY);
            window.location.reload();
        },

        async apiRequest(endpoint, options = {}) {
            const token = this.getToken();

            const headers = {
                'Content-Type': 'application/json',
                'X-Poste-Config': token,
                ...(options.headers || {})
            };

            const response = await fetch(`${this.apiRoute}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401 || response.status === 403) {
                this.logoutSilently();
                throw new Error("Session expirée ou non autorisée.");
            }

            return response;
        },
		
		async loadDictionary() {
            try {
                const response = await this.apiRequest('/devices?action=config');
                if (!response.ok) return false;
                
                const dict = await response.json();
                Alpine.store('app', { dictionary: dict });
                return true;
            } catch (err) { 
                return false; 
            }
        },
		
		async login(username, password) {
            if (!username || !password) {
                throw new Error("Veuillez remplir tous les champs.");
            }

            // On définit les identifiants pour pouvoir tenter la requête
            this.setCredentials(username, password);

            const success = await this.loadDictionary();
            
            if (!success) {
                // Si la tentative échoue, on nettoie les identifiants
                this.logoutSilently();
                throw new Error("Identifiants incorrects.");
            }

            return true;
        }
    });
});