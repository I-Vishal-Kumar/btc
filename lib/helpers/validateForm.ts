
type formDetails = {
    phonenumber: string;
    password: string;
    name: string;
    parent: string;
}

// ✅ Memoized validation function
export  const validateInput = (field: keyof formDetails, value: string) => {
    if (!value) return false;

    switch (field) {
        case "phonenumber":
            return /^[0-9]{10}$/.test(value);
        case "password":
            return value.length >= 5;
        case "name":
            return value.length > 3;
        case "parent":
            return value.length === 8;
        default:
            return false;
    }
};