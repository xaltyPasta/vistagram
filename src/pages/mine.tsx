import Layout from "@/components/Layout";
import Timeline from "@/components/Timeline";


 export default function MinePage(){
    return (
        <Layout title="My Posts">
            <Timeline filter = "mine"/>
        </Layout>
    );
}