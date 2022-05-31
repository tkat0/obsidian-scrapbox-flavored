import React from "react";
import styled from "styled-components";

import { useItem } from "src/hooks/useItem";
import { Card } from "./Card";

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding-left: 8px;
    padding-right: 8px;
`;

export const GridView = () => {
    const itemStates = useItem();

    const items = itemStates.map((item, i) => {
        return <Card {...item}></Card>;
    });

    return <Container>{items}</Container>;
};
