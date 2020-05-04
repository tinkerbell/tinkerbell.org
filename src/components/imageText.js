import React from 'react'
import Img from 'gatsby-image'

const textImage = ({ className = '', data }) => {
  return (
    <>
      <div className={`cell large-6 ${className}`}>
        <Img fluid={data.frontmatter.image.childImageSharp.fluid} />
      </div>
      <div className={`cell large-5 ${className}`}>
        <h2>{data.frontmatter.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </div>
    </>
  )
}

export default textImage
