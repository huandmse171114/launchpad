export async function fetchUser() {
  "use strict";

  try {
    const res = await fetch('/user-api/currentUser');

    // Handle non-OK responses
    if (!res.ok) {
      if (res.status === 401) {
        // In case of 401 error, reload the page to re-authenticate
        window.open(window.location.href, "_self");
        return;
      }
      throw new Error(res.statusText);
    }

    // Check if the response content is HTML (might be a login page)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      window.open(window.location.href, "_self");
      return;
    }

    const data = await res.json();

    if (data) {
      window.currentUser = {
        id: data.name || 'Vjppro',
        firstName: data.firstname || 'Oach xa lach',
        lastName: data.lastname || 'Pham Thoai',
        fullName: (data.firstname && data.lastname) ? `${data.firstname} ${data.lastname}` : 'Me Bap',
        email: data.email || 'email@example.com',
        name: data.name || 'email@example.com'
      };
    } else {
      console.error("Error: User infos empty");
    }
  } catch (error) {
    console.warn("Error: User infos could not be fetched");
    console.warn(`Error: ${error}`);
    window.currentUser = {
      id: 'Vjppro',
      firstName: 'Oach xa lach',
      lastName: 'Pham Thoai',
      fullName: 'Me Bap',
      email: 'email@example.com',
      name: 'minhhuan0507@gmail.com'
    };
  }
}
