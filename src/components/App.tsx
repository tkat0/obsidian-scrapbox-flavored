import React from "react";
import styled from "styled-components";

import { Header } from "./Header";
import { GridView } from "./GridView";
import { Layout } from "./Layout";

const Container = styled.div``;

export const App = () => {
    return (
        <Container>
            <Layout>
                <Header />
                <GridView />
            </Layout>
        </Container>
    );
};
