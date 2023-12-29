import {suggestAAColorVariant} from "accessible-colors"

export const backgroundColor = "#141517"

export const chzzkNicknameColors = [
    "#ECA843", "#EEA05D", "#EA723D", "#EAA35F", "#E98158", "#E97F58", "#E76D53", "#E66D5F", "#E56B79", "#E16490",
    "#E481AE", "#E68199", "#DC5E9A", "#E16CB5", "#D25FAC", "#D263AE", "#D66CB4", "#D071B6", "#BA82BE", "#AF71B5",
    "#A96BB2", "#905FAA", "#B38BC2", "#9D78B8", "#8D7AB8", "#7F68AE", "#9F99C8", "#717DC6", "#5E7DCC", "#5A90C0",
    "#628DCC", "#7994D0", "#81A1CA", "#ADD2DE", "#80BDD3", "#83C5D6", "#8BC8CB", "#91CBC6", "#83C3BB", "#7DBFB2",
    "#AAD6C2", "#84C194", "#B3DBB4", "#92C896", "#94C994", "#9FCE8E", "#A6D293", "#ABD373", "#BFDE73", "#CCE57D"
]

export const originalTwitchNicknameColors = [
    "#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#99CD32", "#FF4400", "#2E8B56", "#DAA520", "#D2691E",
    "#5F9EA0", "#1E8FFF", "#FF69B4", "#8A2BE2", "#00FF80"
]

export const twitchNicknameColors = originalTwitchNicknameColors.map((color) => (
    suggestAAColorVariant(color, backgroundColor)
))
