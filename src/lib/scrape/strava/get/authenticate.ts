import axios from "axios";

interface RequestData {
	cislo: string;
	jmeno: string;
	heslo: string;
}

interface RequestResponse {
	sid: string;
	[key: string]: any;
}

async function authenticate(
	CANTEEN_NUMBER: string,
	USERNAME: string,
	PASSWORD: string
): Promise<string> {
	const data: RequestData = {
		cislo: CANTEEN_NUMBER,
		jmeno: USERNAME,
		heslo: PASSWORD,
	};

	const URL = "https://app.strava.cz/api/login";

	try {
		const response = await axios.post<RequestResponse>(URL, data);
		return response.data.sid;
	} catch (error) {
		throw error;
	}
}

export default authenticate;
