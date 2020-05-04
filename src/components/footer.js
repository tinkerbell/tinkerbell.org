import React from 'react'
import Img from 'gatsby-image'
import { useStaticQuery, graphql } from 'gatsby'
import packetLogo from '../images/packet-logo.png'

const Footer = () => {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "packet-logo.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
  `)

  return (
    <footer id="footer" className="bg-blue">
      <div className="grid-container">
        <section className="grid-x grid-margin-x">
          <div className="cell large-6">
            <p>
              An open source project brought to you by{' '}
              <a href="https://www.packet.com/" title="Packet">
                <img className="footer-logo" src={packetLogo} alt="Packet" />
              </a>
            </p>
            {/* <Img className='footer-logo' fixed={data.placeholderImage.childImageSharp.fixed} /></p> */}
          </div>
          <div className="cell large-6">
            <nav id="nav-footer" className="nav">
              <ul>
                <li>
                  <a href="https://twitter.com/tinkerbell_oss">Twitter</a>
                </li>
                <li>
                  <a href="https://github.com/tinkerbell/">Github</a>
                </li>
                <li>
                  <a href="https://slack.packet.net/">Slack</a>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </div>
    </footer>
  )
}

export default Footer
