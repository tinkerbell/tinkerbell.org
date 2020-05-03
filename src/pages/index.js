import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../layouts/index"
import ImageText from "../components/imageText"
import TextImage from "../components/textImage"

const Homepage = ({ data }) => {
  return (
    <Layout>
      <section className="section larger">
        <div className="grid-container">
          <div className="grid-x grid-padding-x align-justify align-middle">
            <TextImage className={'mb80'} data={data.sectionOne} />
            <ImageText data={data.sectionTwo} />
          </div>
        </div>
      </section>

      <section className="section bg-yellow">
        <div className="grid-container">
          <div className="grid-x grid-padding-x align-center">
            <div className="cell large-10 text-center">
              <h2>{data.sectionThree.frontmatter.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: data.sectionThree.html }} />
            </div>
            <div className="cell large-9 pt40">
              <div className="grid-x grid-padding-x">

                {data.tinkerbellLibs.edges.map((data, index) => {

                  let classNameCell = index === 0 ? "large-12" : "large-4";

                  return (<div key={index} className={"cell " + classNameCell}>
                    <div className="box">
                      <a href="{data.node.url}" className="permalink"></a>
                      <h3>{data.node.title}</h3>
                      <p>{data.node.description}</p>
                    </div>
                  </div>)
                })}

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-blue pb80i">
        <div className="grid-container">
          <div className="grid-x grid-padding-x align-middle align-justify">

            <div className="cell large-6">
              <div className="youtube">
                <iframe src={data.sectionFour.frontmatter.video + '?rel=0&amp;fs=0'} frameBorder="0" allowFullScreen></iframe>
              </div>
            </div>

            <div className="cell large-6 fancy-link">
              <div className="pl50 m-pl0 m-pt40">
                <h2>{data.sectionFour.frontmatter.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: data.sectionFour.html }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Homepage;

export const query = graphql`
  query  {

    tinkerbellLibs: allTinkerbellLibsYaml {
      edges {
        node {
          title
          description
          url
        }
      }
    }

    sectionOne:markdownRemark(frontmatter: {id: {eq: "section-1"}}) {
      html
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 740) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    }

    sectionTwo:markdownRemark(frontmatter: {id: {eq: "section-2"}}) {
      html
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 740) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    }

    sectionThree:markdownRemark(frontmatter: {id: {eq: "section-3"}}) {
      html
      frontmatter {
        title
      }
    }

    sectionFour:markdownRemark(frontmatter: {id: {eq: "section-4"}}) {
      html
      frontmatter {
        title
        video
      }
    }
  }
`
