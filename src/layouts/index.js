import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet";
import '../_scss/tinkerbell.scss';
import Hero from "../components/hero";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { useStaticQuery, graphql } from "gatsby";

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  return (
    <>
      <Helmet title={data.site.siteMetadata.title} defer={false}>
        <link
          href="https://cloud.typography.com/6193438/7900212/css/fonts.css"
          rel="stylesheet"
        />
        <meta name="description" content={data.site.siteMetadata.description} />
      </Helmet>
      <Nav />
      <Hero />
      <div id="content-wrapper">
        {children}
      </div>
      <Footer />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
