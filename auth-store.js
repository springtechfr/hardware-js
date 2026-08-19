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
                this.logout();
                throw new Error("Session expirée ou non autorisée.");
            }

            return response;
        }
    });
});