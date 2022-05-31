import React, { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
    max-width: 1200px;
    margin-right: auto;
    margin-left: auto;
    padding-right: auto;
    padding-left: auto;
`;

export interface LayoutProps {
    children: ReactNode;
}

export const Layout = (props: LayoutProps) => {
    return <Container>{props.children}</Container>;
};
