"use client"

export function LogIn() {

    function submit(e: any) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        console.log(form);
        
        const formData = new FormData(form);
        console.log(formData);
        
        try {
            let res = fetch("http://localhost:9000/api/v1/user/signin", {
                method: "POST",
                body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            res.then((data) => {
                return data.json()
            }).then((d) => {
                console.log(d);
            }).catch(e => {console.error(e)})

            console.log("Log in successfull");

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <form onSubmit={submit}>
            <div>
                <input type="email" name="email"/>

            </div>

            <input type="password" name="password"/>

            <button>Submit</button>
        </form>
    )
}