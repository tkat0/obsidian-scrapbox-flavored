import React from "react";
import styled from "styled-components";

const Container = styled.div`
    background-color: var(--background-secondary);
    width: 100%;
    aspect-ratio: 1.1;
    overflow: hidden;
    &:hover {
        background-color: var(--background-secondary-alt);
    }
`;

// TODO(tkat0): Support star
// height: 10 + 10 + 20 + 10 = 50px
const Header = styled.div`
    border-top: var(--background-modifier-border) solid 10px;
    padding: 10px 12px;
`;

const Title = styled.div`
    text-overflow: ellipsis;
    font-weight: 500;
    max-height: 20px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    color: var(--text-accent);
`;

const Contents = styled.div`
    overflow: hidden;
    /* Container - Header (50px) - margin (5px) */
    height: calc(100% - 55px);
    margin: 0 10px 0;
`;

const Thumbnail = styled.img`
    overflow: hidden;
    height: 100%;
    display: block;
    margin: auto;
    padding: 0 5px;
`;

const Description = styled.div`
    overflow: hidden;
    height: 100%;
    line-height: 20px;
    font-size: 12px;
`;

const Line = styled.p`
    display: inline;
`;

export interface CardProps {
    title: string;
    thumbnail: string | undefined;
    description: string[];
    onClick: () => void;
}

export const Card = (props: CardProps) => {
    const { title, thumbnail: icon, description, onClick } = props;
    return (
        <Container onClick={onClick}>
            <Header>
                <Title>
                    <a>{title}</a>
                </Title>
            </Header>
            <Contents>
                {icon ? (
                    <Thumbnail loading="lazy" src={icon}></Thumbnail>
                ) : (
                    <Description>
                        {description.map((line) => (
                            <Line>{line}</Line>
                        ))}
                    </Description>
                )}
            </Contents>
        </Container>
    );
};
