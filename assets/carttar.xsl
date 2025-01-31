<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html" indent="yes" />

    <xsl:template match="/">
        <html>
        <head>
            <title>Cartar - Watch E-commerce</title>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f4f4f4;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
            </style>
        </head>
        <body>
            <h1>Cartar - Watch E-commerce</h1>
            <table>
                <tr>
                    <th>Brand Name</th>
                    <th>Country</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Availability</th>
                </tr>
                <xsl:for-each select="cartar/product">
                    <xsl:sort select="price" data-type="number" order="ascending" />
                    <tr>
                        <xsl:if test="position()=1 or preceding-sibling::product[brandName=current()/brandName]">
                            <td rowspan="{count(/cartar/product[brandName=current()/brandName])}">
                                <xsl:value-of select="brandName" />
                            </td>
                            <td rowspan="{count(/cartar/product[brandName=current()/brandName])}">
                                <xsl:value-of select="/cartar/brand[brandName=current()/brandName]/country" />
                            </td>
                        </xsl:if>
                        <td><xsl:value-of select="productName" /></td>
                        <td><xsl:value-of select="price" /></td>
                        <td>
                            <xsl:choose>
                                <xsl:when test="availability='true'">In Stock</xsl:when>
                                <xsl:otherwise>Out of Stock</xsl:otherwise>
                            </xsl:choose>
                        </td>
                    </tr>
                </xsl:for-each>
            </table>
        </body>
        </html>
    </xsl:template>
</xsl:stylesheet>