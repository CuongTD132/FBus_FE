const handleAddCoordination = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.accessToken) {
        try {
            const res = await axios.post(
                "https://fbus-final.azurewebsites.net/api/coordinations",
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${user.accessToken}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (res.status === 200) {
                toast.success("Coordination has been added successfully!", {
                    autoClose: 1000,
                });
                setShowAdd(false);
            }
        } catch (e) {
            if (e.response && e.response.status === 401) {
                toast("You need to log in again to continue!", {
                    autoClose: 1000,
                });
                navigate("/auth/login");
            } else {
                toast.error("Failed to add this coordination!", {
                    autoClose: 1000,
                });
                setShowAdd(true);
            }
        }
    }
};