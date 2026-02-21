import Layout from "@/components/Layout";
import Timeline from "@/components/Timeline";

 export default function PolularPage(){
    return (
        <Layout  title="Popular Posts">
            <Timeline filter="popular"/>
        </Layout>
    );
}