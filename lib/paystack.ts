let scriptLoaded = false;

export const getPaystack = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("Window is undefined");

    if (scriptLoaded) {
      return resolve((window as any).PaystackPop);
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => {
      scriptLoaded = true;
      resolve((window as any).PaystackPop);
    };
    script.onerror = () => reject("Failed to load Paystack script");

    document.body.appendChild(script);
  });
};
