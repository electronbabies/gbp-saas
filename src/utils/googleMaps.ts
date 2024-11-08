class GoogleMapsManager {
  private static instance: GoogleMapsManager;
  private scriptLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private scriptId = 'google-maps-script';

  private constructor() {}

  public static getInstance(): GoogleMapsManager {
    if (!GoogleMapsManager.instance) {
      GoogleMapsManager.instance = new GoogleMapsManager();
    }
    return GoogleMapsManager.instance;
  }

  public async loadGoogleMaps(apiKey: string): Promise<void> {
    if (this.scriptLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Clean up any existing scripts first
        this.cleanup();

        // Create and append the script
        const script = document.createElement('script');
        script.id = this.scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.scriptLoaded = true;
          this.loadPromise = null;
          resolve();
        };

        script.onerror = () => {
          this.cleanup();
          this.loadPromise = null;
          reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
      } catch (error) {
        this.cleanup();
        this.loadPromise = null;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  public cleanup(): void {
    const script = document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }

    // Remove the Google Maps object
    if ('google' in window) {
      delete (window as any).google;
    }

    // Reset state
    this.scriptLoaded = false;
    this.loadPromise = null;
  }

  public isLoaded(): boolean {
    return this.scriptLoaded && !!window.google?.maps;
  }
}

export const googleMapsManager = GoogleMapsManager.getInstance();