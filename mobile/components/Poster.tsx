import { View, type ViewProps } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

type Props = ViewProps & {
  uri: string
  aspectRatio?: number
  overlay?: boolean
}

export function Poster({ uri, aspectRatio = 16 / 9, overlay = true, style, children, ...props }: Props) {
  return (
    <View style={[{ aspectRatio, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1B251E' }, style]} {...props}>
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={300}
        cachePolicy="disk"
      />
      {overlay && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
      {children && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{children}</View>
      )}
    </View>
  )
}
