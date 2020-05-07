import React from 'react'
import Img from 'gatsby-image'

const videoText = ({ className = '', data }) => {
  return (
    <div className="grid-x grid-padding-x align-justify">
      <div className={`cell large-6 ${className}`}>
        <div className="youtube">
          <iframe
            src={data.frontmatter.video + '?rel=0&amp;fs=0'}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className={`cell large-6 fancy-link ${className}`}>
        <div className="pl50 m-pl0 m-pt40">
          <h2>{data.frontmatter.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: data.html }} />
        </div>
      </div>
    </div>
  )
}

export default videoText
