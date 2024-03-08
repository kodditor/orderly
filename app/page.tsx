import Header from "../components/Header.component";
import Footer from "@/components/Footer.component";
import { getUser } from "./utils/backend/utils";
import ClientHome from "@/components/dashboard/Home.component";

export default async function Home() {

	const {user} = await getUser()

	return (
		<>
			<Header signedInUser={user} />
			<ClientHome />
			<Footer />
		</>
	)
}
