import React from 'react'
import Img from 'gatsby-image'

const textImage = ({ className = '', data }) => {
  return (
    <div className="grid-x grid-padding-x align-justify align-middle">
      <div className={`cell large-6 medium-order-1 small-order-1 m-mb40 ${className}`}><Img fluid={data.frontmatter.image.childImageSharp.fluid} /></div>
      <div className={`cell large-5 medium-order-2 small-order-2 ${className}`}>
        <h2>{data.frontmatter.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </div>
    </div>
  )
}

export default textImage
