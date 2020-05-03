import React from 'react';
import tinkerbellLogo from "../images/tinkerbell-logo.png"
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

const Hero = () => {

  const data = useStaticQuery(graphql`
  query  {
    markdownRemark(frontmatter: {id: {eq: "hero"}}) {
      html
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
  `)

  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  return (
    <header id="hero">
      <div className="grid-container">
        <section className="grid-x grid-padding-x align-middle hero-content">
          <div className="cell large-5 pr0">
            <h1>{frontmatter.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="cell large-7">
            <Img className="hero-image" fluid={frontmatter.image.childImageSharp.fluid} />
          </div>
        </section>
      </div>
    </header >
  )
}

export default Hero
