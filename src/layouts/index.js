import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import '../_scss/tinkerbell.scss'
import Hero from '../components/hero'
import Nav from '../components/nav'
import Footer from '../components/footer'
import SEO from '../components/seo'
import { useStaticQuery, graphql } from 'gatsby'

const Layout = ({ children, hero = true }) => {

  let heroTag = ''

  if (hero === true) {
    heroTag = <Hero />
  }
  return (
    <>
      <SEO />
      <Nav />
      {heroTag}
      <div id="content-wrapper">{children}</div>
      <Footer />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
