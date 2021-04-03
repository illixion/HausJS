window.onload = () => {
    const alert = new URL(window.location.href).searchParams.get("alert");
    if (alert !== null) Swal.fire(alert, "", "info");
};
