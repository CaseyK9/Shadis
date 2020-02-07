import React from 'react';
import { Button, ButtonAppearance, Background } from "@microsoft/fast-components-react-msft";
import { neutralLayerL1 } from "@microsoft/fast-components-styles-msft";
import { PogodaDesignToolkit } from '../_DesignSystem';
import './App.scss';

class App extends React.Component {
  static contextType = PogodaDesignToolkit

  public render = (): React.ReactNode => (
    <Background className="container" value={neutralLayerL1}>
        <Button appearance={ButtonAppearance.justified} onClick={this.context.toggleTheme}>Toggle Theme</Button>
    </Background>
  );
}

export default App;
